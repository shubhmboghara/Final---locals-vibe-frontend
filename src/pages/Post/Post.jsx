import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPost, updatePost } from "../../api/postApi";
import { createEvent, updateEvent } from "../../api/eventApi";
import { createPoll } from "../../api/pollApi";
import { getCurrentUser } from "../../api/userApi";
import {
  FiArrowLeft,
  FiMapPin,
  FiCheckCircle,
  FiChevronDown,
  FiGlobe,
  FiUsers,
  FiUserCheck,
  FiLock,
  FiX,
  FiUploadCloud,
  FiPlus,
  FiEdit3,
  FiCalendar,
  FiBarChart2,
  FiUser,
  FiLink,
  FiPlay,
  FiClock,
} from "react-icons/fi";

const POST_TYPES = [
  { id: "post", label: "Post", icon: FiEdit3 },
  { id: "event", label: "Event", icon: FiCalendar },

  { id: "poll", label: "Poll", icon: FiBarChart2 },
];

const VISIBILITY_OPTIONS = [
  { id: "public", label: "Public" },
  { id: "neighbors", label: "Neighbors" },
  { id: "friends", label: "Friends" },
  { id: "onlyMe", label: "Only Me" },
];

const EVENT_CATEGORIES = ["Community", "Sports", "Education", "Festival", "Charity"];

const POLL_DURATIONS = [
  { id: "1d", label: "1 Day" },
  { id: "3d", label: "3 Days" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
];

const MAX_FILE_SIZE_MB = 10;
const SUPPORTED_MEDIA_TYPES = ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm", "video/quicktime"];
const MAX_POLL_OPTIONS = 6;

const INITIAL_FORM_STATE = {
  post: {
    content: "",
    mediaFiles: []
  },
  event: {
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    maxParticipants: "",
    registrationLink: "",
    banner: null,
    organizer: "",
    category: "",
  },
  poll: {
    question: "",
    options: ["", ""],
    duration: "3d",
    allowMultipleVotes: false,
    showLiveResults: true,
  },
};

const inputClass =
  "w-full rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-[#1E293B] dark:text-neutral-100 " +
  "placeholder:text-[#94A3B8] dark:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#006A40]/30";

const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-neutral-400";

function PrimaryButton({ children, onClick, type = "button", disabled = false, className = "", icon: Icon = null }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#006A40] px-6 py-3
        text-sm font-semibold text-white shadow-sm transition-all duration-200
        hover:bg-[#005030] hover:shadow-md active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#006A40]
        focus:outline-none focus:ring-2 focus:ring-[#006A40]/40 focus:ring-offset-2
        ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, type = "button", disabled = false, className = "", icon: Icon = null }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] dark:border-neutral-700
        bg-white dark:bg-neutral-800 px-6 py-3 text-sm font-semibold text-[#1E293B] dark:text-neutral-100 shadow-sm transition-all duration-200
        hover:border-[#006A40] dark:hover:border-[#4ade80]/30 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800 active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-50
        focus:outline-none focus:ring-2 focus:ring-[#006A40]/20 focus:ring-offset-2
        ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function ToggleRow({ label, value, onChange, onLabel = "Yes", offLabel = "No" }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 bg-[#F8FAFC] dark:bg-neutral-900/50 px-4 py-3">
      <span className="text-sm font-medium text-[#1E293B] dark:text-neutral-100">{label}</span>
      <div className="flex overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 text-xs font-semibold transition-colors ${value ? "bg-[#006A40] text-white" : "text-[#64748B] dark:text-neutral-400"
            }`}
        >
          {onLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 text-xs font-semibold transition-colors ${!value ? "bg-[#006A40] text-white" : "text-[#64748B] dark:text-neutral-400"
            }`}
        >
          {offLabel}
        </button>
      </div>
    </div>
  );
}

const VISIBILITY_ICONS = {
  public: FiGlobe,
  neighbors: FiUsers,
  friends: FiUserCheck,
  onlyMe: FiLock,
};

function VisibilityDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = VISIBILITY_OPTIONS.find((option) => option.id === value) || VISIBILITY_OPTIONS[0];
  const SelectedIcon = VISIBILITY_ICONS[selected.id];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-neutral-700 bg-[#F8FAFC] dark:bg-neutral-900/50
          px-3 py-1.5 text-xs font-medium text-[#64748B] dark:text-neutral-400 transition-colors duration-150
          hover:border-[#006A40] dark:hover:border-[#4ade80]/30 hover:text-[#006A40] dark:hover:text-[#4ade80]"
      >
        <SelectedIcon className="h-3.5 w-3.5" />
        {selected.label}
        <FiChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 py-1 shadow-lg">
          {VISIBILITY_OPTIONS.map((option) => {
            const OptionIcon = VISIBILITY_ICONS[option.id];
            const isActive = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors
                  ${isActive ? "bg-[#006A40]/10 text-[#006A40]" : "text-[#1E293B] dark:text-neutral-100 hover:bg-[#F8FAFC] dark:hover:bg-neutral-800"}`}
              >
                <OptionIcon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UploadArea({
  accept = "image/*",
  multiple = true,
  onFiles,
  label = "Choose Images",
  hint = "Drag & drop, or click to browse",
  error,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length > 0) onFiles(files);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2
          border-dashed px-6 py-10 text-center transition-colors duration-200
          ${isDragging
            ? "border-[#006A40] bg-[#006A40]/5"
            : error
              ? "border-red-300 bg-red-50/40"
              : "border-[#E2E8F0] dark:border-neutral-700 bg-[#F8FAFC] dark:bg-neutral-900/50 hover:border-[#006A40] dark:hover:border-[#4ade80]/40"
          }`}
      >
        <FiUploadCloud className={`h-8 w-8 ${isDragging ? "text-[#006A40]" : "text-[#64748B] dark:text-neutral-400"}`} />
        <p className="text-sm font-semibold text-[#1E293B] dark:text-neutral-100">{label}</p>
        <p className="text-xs text-[#64748B] dark:text-neutral-400">{hint}</p>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function MediaGrid({ media, onRemove }) {
  if (!media || media.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {media.map((item, index) => (
        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            {item.type === "video" ? (
              <video src={item.previewUrl} className="h-full w-full object-cover" muted />
            ) : (
              <img src={item.previewUrl} alt={`Upload preview ${index + 1}`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            )}
          </div>
          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <FiPlay className="text-white h-8 w-8 opacity-80" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="Remove media"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-xl bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/80"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
function PostHeader({ user, visibility, onVisibilityChange }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm">
      <div className="h-14 w-14 flex-shrink-0 rounded-2xl ring-2 ring-[#006A40]/10 overflow-hidden bg-[#006A40] flex items-center justify-center text-white text-xl font-bold">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          user?.name ? user.name.charAt(0).toUpperCase() : "U"
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-semibold text-[#1E293B] dark:text-neutral-100">{user?.name || ""}</span>
          {user?.verified && <FiCheckCircle className="h-4 w-4 flex-shrink-0 text-[#006A40]" title="Verified" />}
        </div>
        <p className="truncate text-sm text-[#64748B] dark:text-neutral-400">
          {user?.email ? `@${user.email.split("@")[0]}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 rounded-xl bg-[#F8FAFC] dark:bg-neutral-900/50 px-2.5 py-1 text-xs text-[#64748B] dark:text-neutral-400">
            <FiMapPin className="h-3.5 w-3.5" />
            {user?.neighborhood ? `${user.neighborhood}${user.city ? ", " + user.city : ""}` : user?.city || ""}
          </span>
          <VisibilityDropdown value={visibility} onChange={onVisibilityChange} />
        </div>
      </div>
    </div>
  );
}

function PostTypeTabs({ activeType, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {POST_TYPES.map(({ id, label, icon: Icon }) => {
        const isActive = id === activeType;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={isActive}
            className={`flex flex-shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm
              font-medium transition-all duration-200
              ${isActive
                ? "border-[#006A40] bg-[#006A40] text-white shadow-sm"
                : "border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[#64748B] dark:text-neutral-400 hover:border-[#006A40] dark:hover:border-[#4ade80]/30 hover:text-[#006A40] dark:hover:text-[#4ade80]"
              }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyPreview({ label }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-xl bg-[#F8FAFC] dark:bg-neutral-900/50 text-xs text-[#94A3B8] dark:text-neutral-500">{label}</div>
  );
}

function PreviewBody({ postType, data }) {
  switch (postType) {

    case "post":
      const mediaCount = data.mediaFiles?.length || 0;
      return (
        <>
          {data.content && (
            <p className="text-sm text-[#1E293B] dark:text-neutral-100 mb-3 whitespace-pre-wrap">
              {data.content}
            </p>
          )}
          {mediaCount > 0 && (
            <div className={`mb-3 grid gap-1 overflow-hidden rounded-2xl ${
              mediaCount === 1 ? "grid-cols-1" :
              mediaCount === 2 ? "grid-cols-2 h-64" :
              mediaCount === 3 ? "grid-cols-2 grid-rows-2 h-80" :
              "grid-cols-2 grid-rows-2 h-80"
            }`}>
              {data.mediaFiles.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-black w-full h-full ${
                    mediaCount === 3 && index === 0 ? "row-span-2" : ""
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.type === "video" ? (
                      <video
                        src={item.previewUrl}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.previewUrl}
                        alt=""
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <FiPlay className="text-white h-8 w-8 opacity-80" />
                    </div>
                  )}
                  
                  {index === 3 && mediaCount > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        +{mediaCount - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      );

    case "event":
      return (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 overflow-hidden mb-3 bg-white dark:bg-neutral-800 shadow-sm">

          
          {data.banner ? (
            <img
              src={data.banner.previewUrl}
              alt="Event Banner"
              className="h-32 w-full object-cover"
            />
          ) : (
            <div className="h-32 bg-gradient-to-br from-[#006A40] to-[#0F172A] flex items-center justify-center">
              <FiCalendar className="text-white/70" size={42} />
            </div>
          )}

          
          <div className="p-4">

            
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
              {data.title || "Untitled Event"}
            </h3>

            
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#64748B] dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <FiCalendar size={13} />
                {data.date || "Date TBD"}
              </span>

              <span className="flex items-center gap-1">
                <FiClock size={13} />
                {data.startTime || "--:--"}
              </span>
            </div>

            
            <p className="mt-2 text-xs text-[#94A3B8] dark:text-neutral-500">
              By {data.organizer || "Organizer"}
            </p>

            
            {data.venue && (
              <div className="mt-2 flex items-center gap-1 text-xs text-[#64748B] dark:text-neutral-400">
                <FiMapPin size={13} />
                <span>{data.venue}</span>
              </div>
            )}

            
            {data.description && (
              <p className="mt-3 text-sm text-[#475569] line-clamp-2">
                {data.description}
              </p>
            )}

            
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-1.5 rounded-full bg-[#006A40] text-white text-xs font-semibold"
              >
                Join
              </button>

              <button
                type="button"
                className="px-4 py-1.5 rounded-full border border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] dark:text-neutral-400 text-xs font-semibold"
              >
                Interested
              </button>
            </div>
          </div>
        </div>
      );

    case "poll":
      return (
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 mb-3">

          
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006A40]/10">
              <FiBarChart2 className="text-[#006A40] text-lg" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
                {data.question || "Your poll question"}
              </h3>

              {data.description && (
                <p className="mt-1 text-sm text-[#64748B] dark:text-neutral-400">
                  {data.description}
                </p>
              )}
            </div>
          </div>

          
          <div className="space-y-2">
            {data.options
              .filter((option) => option.trim() !== "")
              .map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="relative w-full overflow-hidden rounded-xl border border-[#E2E8F0] dark:border-neutral-700 bg-[#F8FAFC] dark:bg-neutral-900/50 px-3 py-2 text-left transition duration-200 hover:border-[#006A40] dark:hover:border-[#4ade80]/30 hover:bg-[#006A40]/5"
                >
                  <span className="relative flex items-center justify-between text-xs font-medium text-[#1E293B] dark:text-neutral-100">
                    <span>{option}</span>

                    
                    <span className="text-[#94A3B8] dark:text-neutral-500 text-[11px]">
                      --%
                    </span>
                  </span>
                </button>
              ))}

            
            {data.options.filter((option) => option.trim() !== "").length === 0 && (
              <div className="rounded-xl border border-dashed border-[#CBD5E1] py-6 text-center text-sm text-[#94A3B8] dark:text-neutral-500">
                Poll options will appear here
              </div>
            )}
          </div>

          
          <p className="mt-3 text-[11px] text-[#94A3B8] dark:text-neutral-500">
            0 votes
          </p>

          
        </div>
      );

    default:
      return null;
  }
}

function PostPreview({ user, postType, formData }) {
  const avatarSrc = user?.avatar || user?.avatarUrl;
  const displayName = user?.name || "";

  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B] dark:text-neutral-400">
        Live Preview
      </p>

      <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden bg-[#006A40] flex items-center justify-center text-white font-bold flex-shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              displayName ? displayName.charAt(0).toUpperCase() : "U"
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate text-sm font-semibold text-[#1E293B] dark:text-neutral-100">
                {displayName}
              </span>
              {user?.verified && <FiCheckCircle className="h-3.5 w-3.5 text-[#006A40]" />}
            </div>
            <p className="text-xs text-[#64748B] dark:text-neutral-400">Just now</p>
          </div>
        </div>

        <div className="mt-3">
          <PreviewBody postType={postType} data={formData} />
        </div>
      </div>
    </div>
  );
}

function MediaPostForm({ data, onChange, errors }) {
  function handleFiles(files) {
    const newFiles = files
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        type: file.type.startsWith("video/") ? "video" : "image",
        previewUrl: URL.createObjectURL(file),
      }));
    onChange({ ...data, mediaFiles: [...data.mediaFiles, ...newFiles] });
  }

  function removeMedia(id) {
    onChange({ ...data, mediaFiles: data.mediaFiles.filter((m) => m.id !== id) });
  }

  return (
    <div className="space-y-5">
      <UploadArea
        accept="image/*,video/*"
        multiple
        onFiles={handleFiles}
        label="Choose Images/Videos"
        hint="Images and videos up to 10MB each"
        error={errors.mediaFiles}
      />
      <MediaGrid media={data.mediaFiles} onRemove={removeMedia} />
      <div>
        <textarea
          value={data.content}
          onChange={(e) => {
            if (e.target.value.length <= 280) {
              onChange({ ...data, content: e.target.value });
            }
          }}
          placeholder="What's happening in your neighborhood?"
          rows={4}
          className={`w-full resize-none rounded-2xl border bg-white dark:bg-neutral-800 px-4 py-3 text-sm text-[#1E293B] dark:text-neutral-100
            placeholder:text-[#94A3B8] dark:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#006A40]/30
            ${errors.content ? "border-red-300" : "border-[#E2E8F0] dark:border-neutral-700"}`}
        />
        <div className="mt-1 flex items-center justify-between px-1">
          {errors.content ? (
            <p className="text-xs font-medium text-red-500">{errors.content}</p>
          ) : (
            <div />
          )}
          <span className={`text-xs font-medium ${data.content.length === 280 ? 'text-red-500' : 'text-[#94A3B8] dark:text-neutral-500'}`}>
            {data.content.length}/280
          </span>
        </div>
      </div>
    </div>
  );
}
function EventPostForm({ data, onChange, errors }) {
  function set(field) {
    return (e) => onChange({ ...data, [field]: e.target.value });
  }

  function handleBannerFiles(files) {
    const file = files[0];
    if (!file) return;
    onChange({ ...data, banner: { file, previewUrl: URL.createObjectURL(file) } });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Event Title</label>
        <input
          type="text"
          value={data.title}
          onChange={set("title")}
          placeholder="Neighborhood Cleanup Drive"
          className={`${inputClass} ${errors.title ? "border-red-300" : ""}`}
        />
        {errors.title && <p className="mt-1 text-xs font-medium text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={data.description}
          onChange={set("description")}
          rows={4}
          placeholder="Tell people what to expect..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={data.date}
            onChange={set("date")}
            className={`${inputClass} ${errors.date ? "border-red-300" : ""}`}
          />
          {errors.date && <p className="mt-1 text-xs font-medium text-red-500">{errors.date}</p>}
        </div>
        <div>
          <label className={labelClass}>Start Time</label>
          <input type="time" value={data.startTime} onChange={set("startTime")} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End Time</label>
          <input type="time" value={data.endTime} onChange={set("endTime")} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Venue</label>
        <input type="text" value={data.venue} onChange={set("venue")} placeholder="Community Hall" className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Maximum Participants</label>
          <div className="relative">
            <FiUsers className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-neutral-400" />
            <input
              type="number"
              min="1"
              value={data.maxParticipants}
              onChange={set("maxParticipants")}
              placeholder="50"
              className={`${inputClass} pl-11 ${errors.maxParticipants ? "border-red-300" : ""}`}
            />
          </div>
          {errors.maxParticipants && <p className="mt-1 text-xs font-medium text-red-500">{errors.maxParticipants}</p>}
        </div>
        <div>
          <label className={labelClass}>Registration Link</label>
          <div className="relative">
            <FiLink className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-neutral-400" />
            <input
              type="url"
              value={data.registrationLink}
              onChange={set("registrationLink")}
              placeholder="https://..."
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Banner</label>
        {data.banner ? (
          <div className="group relative h-40 w-full overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-neutral-700">
            <img src={data.banner.previewUrl} alt="Event banner preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange({ ...data, banner: null })}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-xl
                bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ) : (
          <UploadArea accept="image/*" multiple={false} onFiles={handleBannerFiles} label="Upload Banner" hint="Recommended 1200×400" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Organizer</label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B] dark:text-neutral-400" />
            <input
              type="text"
              value={data.organizer}
              onChange={set("organizer")}
              placeholder="Organizer name"
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select value={data.category} onChange={set("category")} className={inputClass}>
            <option value="">Select category</option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function PollPostForm({ data, onChange, errors }) {
  function setQuestion(e) {
    onChange({ ...data, question: e.target.value });
  }

  function setOption(index, value) {
    const options = [...data.options];
    options[index] = value;
    onChange({ ...data, options });
  }

  function addOption() {
    if (data.options.length >= MAX_POLL_OPTIONS) return;
    onChange({ ...data, options: [...data.options, ""] });
  }

  function removeOption(index) {
    if (data.options.length <= 2) return;
    onChange({ ...data, options: data.options.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Poll Question</label>
        <input
          type="text"
          value={data.question}
          onChange={setQuestion}
          placeholder="Ask your neighborhood..."
          className={`${inputClass} ${errors.question ? "border-red-300" : ""}`}
        />
        {errors.question && <p className="mt-1 text-xs font-medium text-red-500">{errors.question}</p>}
      </div>

      <div>
        <label className={labelClass}>Options</label>
        <div className="space-y-2">
          {data.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => setOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className={`${inputClass} ${errors.options ? "border-red-300" : ""}`}
              />
              {data.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  aria-label="Remove option"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl
                    text-[#64748B] dark:text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.options && <p className="mt-1 text-xs font-medium text-red-500">{errors.options}</p>}

        {data.options.length < MAX_POLL_OPTIONS && (
          <button
            type="button"
            onClick={addOption}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#006A40] transition-colors hover:text-[#005030]"
          >
            <FiPlus className="h-4 w-4" /> Add Option
          </button>
        )}
      </div>

      <div>
        <label className={labelClass}>Poll Duration</label>
        <div className="flex flex-wrap gap-2">
          {POLL_DURATIONS.map((duration) => {
            const isActive = data.duration === duration.id;
            return (
              <button
                key={duration.id}
                type="button"
                onClick={() => onChange({ ...data, duration: duration.id })}
                className={`rounded-xl border px-4 py-1.5 text-xs font-semibold transition-colors
                  ${isActive ? "border-[#006A40] bg-[#006A40] text-white" : "border-[#E2E8F0] dark:border-neutral-700 text-[#64748B] dark:text-neutral-400 hover:border-[#006A40] dark:hover:border-[#4ade80]/30"}`}
              >
                {duration.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ToggleRow
          label="Allow Multiple Votes"
          value={data.allowMultipleVotes}
          onChange={(value) => onChange({ ...data, allowMultipleVotes: value })}
          onLabel="On"
          offLabel="Off"
        />
      </div>
    </div>
  );
}

function Post() {
  const navigate = useNavigate();
  const location = useLocation();

  const [postType, setPostType] = useState(location.state?.postType || "post");
  const [visibility, setVisibility] = useState("public");
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedMessage, setPublishedMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  
  useEffect(() => {
    getCurrentUser()
      .then((u) => setCurrentUser(u?.user || u || null))
      .catch(() => {});
  }, []);

  const activeData = formState[postType];

  function updateActiveData(nextData) {
    setFormState((prev) => ({ ...prev, [postType]: nextData }));
    if (Object.keys(errors).length > 0) setErrors({});
  }

  function handleTypeChange(nextType) {
    setPostType(nextType);
    setErrors({});
    setPublishedMessage("");
  }

  const validate = useMemo(
    () => () => {
      const nextErrors = {};
      const data = formState[postType];

      function checkFileType(file) {
        return SUPPORTED_MEDIA_TYPES.includes(file.type);
      }
      function checkFileSize(file) {
        return file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
      }
      function validateMediaList(mediaFiles) {
        for (const media of mediaFiles) {
          if (!checkFileType(media.file)) return "Unsupported file type. Use PNG, JPG, WEBP, MP4, WEBM, or MOV.";
          if (!checkFileSize(media.file)) return `Each file must be under ${MAX_FILE_SIZE_MB}MB.`;
        }
        return null;
      }

      if (postType === "post") {
        if (!data.content.trim()) nextErrors.content = "Content is required.";
        if (data.mediaFiles.length > 0) {
          const mediaError = validateMediaList(data.mediaFiles);
          if (mediaError) nextErrors.mediaFiles = mediaError;
        }
      }

      if (postType === "event") {
        if (!data.title.trim()) nextErrors.title = "Event title is required.";
        if (!data.date) nextErrors.date = "Please choose a valid date.";
        else if (new Date(data.date) < new Date(new Date().toDateString())) {
          nextErrors.date = "Date cannot be in the past.";
        }
        if (data.maxParticipants && Number(data.maxParticipants) <= 0) {
          nextErrors.maxParticipants = "Enter a valid participant count.";
        }
      }

      if (postType === "question") {
        if (!data.title.trim()) nextErrors.title = "Question title is required.";
      }

      if (postType === "poll") {
        if (!data.question.trim()) nextErrors.question = "Poll question is required.";
        const filledOptions = data.options.filter((option) => option.trim() !== "");
        if (filledOptions.length < 2) nextErrors.options = "Add at least two options.";
      }

      return nextErrors;
    },
    [formState, postType]
  );

  async function handlePublish() {
    const validationErrors = validate();
    setErrors(validationErrors);
    setPublishedMessage("");

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const editingPost = location.state?.editingPost;
      
      if (postType === "event") {
        const formData = new FormData();
        formData.append("title", activeData.title);
        formData.append("description", activeData.description);
        formData.append("date", activeData.date);
        formData.append("startTime", activeData.startTime);
        formData.append("endTime", activeData.endTime);
        formData.append("venue", activeData.venue);
        formData.append("category", activeData.category);
        if (activeData.maxParticipants) formData.append("maxParticipants", activeData.maxParticipants);
        if (activeData.registrationLink) formData.append("registrationLink", activeData.registrationLink);
        if (activeData.organizer) formData.append("organizer", activeData.organizer);
        if (activeData.banner && activeData.banner.file) {
          formData.append("banner", activeData.banner.file);
        }

        if (editingPost) {
          await updateEvent(editingPost._id || editingPost.id, formData);
          setPublishedMessage("Event updated successfully!");
        } else {
          await createEvent(formData);
          setPublishedMessage("Event published successfully!");
        }
      } else if (postType === "poll") {
        await createPoll({
          question: activeData.question,
          options: activeData.options.filter(opt => opt.trim() !== ""),
          duration: activeData.duration,
          allowMultipleVotes: activeData.allowMultipleVotes,
        });
        setPublishedMessage("Poll published successfully!");
      } else {
        if (editingPost) {
          const mediaToRemove = editingPost.mediaToRemove || [];
          const newMediaFiles = activeData.mediaFiles
            ? activeData.mediaFiles.map((m) => m.file).filter(Boolean)
            : [];
          await updatePost(editingPost._id || editingPost.id, {
            content: activeData.content,
            mediaToRemove,
            newMediaFiles,
          });
          setPublishedMessage("Post updated successfully!");
        } else {
          const mediaFiles = activeData.mediaFiles
            ? activeData.mediaFiles.map((m) => m.file).filter(Boolean)
            : [];
          const contentText = activeData.content || activeData.title || activeData.question || "";
          await createPost({
            content: contentText,
            mediaFiles,
          });
          setPublishedMessage("Post published successfully!");
        }
      }
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setErrors({ api: err.message || "Failed to submit post" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  function renderForm() {
    switch (postType) {
      case "post":
        return <MediaPostForm data={activeData} onChange={updateActiveData} errors={errors} />;
      case "event":
        return <EventPostForm data={activeData} onChange={updateActiveData} errors={errors} />;
      case "poll":
        return <PollPostForm data={activeData} onChange={updateActiveData} errors={errors} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen pb-28 lg:pb-10 p-8">
      <div className="mx-auto max-w-6xl  py-6 sm:px-6 lg:px-8">

        <div className=" flex items-center justify-between gap-4 ">
          <h1 className="mb-6 text-2xl font-bold text-[#1E293B] dark:text-neutral-100 sm:text-2xl">Create New Post</h1>
          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 cursor-pointer flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-neutral-400 transition-colors hover:text-[#006A40] dark:hover:text-[#4ade80]"
          >
            <FiArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">

            <PostTypeTabs activeType={postType} onChange={handleTypeChange} />

            <div className="rounded-2xl border border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 shadow-sm sm:p-6">{renderForm()}</div>

            {errors.api && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                {errors.api}
              </div>
            )}

            {publishedMessage && (
              <div className="rounded-2xl border border-[#006A40]/20 bg-[#006A40]/5 px-4 py-3 text-sm font-medium text-[#006A40]">
                {publishedMessage}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-6 lg:self-start">
            <PostPreview user={currentUser} postType={postType} formData={activeData} />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E2E8F0] dark:border-neutral-700 bg-white dark:bg-neutral-800/95 px-4 py-3 backdrop-blur-sm lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:dark:bg-transparent lg:px-0 lg:py-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 lg:px-0">
          <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={handlePublish} disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </PrimaryButton>
        </div>
      </div>
    </div >
  );
}

export default Post;