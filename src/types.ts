/**
 * JSON that Claude Code writes to the status line command's stdin.
 *
 * Synced with https://code.claude.com/docs/en/statusline ("Available data") as of
 * Claude Code 2.1.29x. Every field is typed optional even where the docs say it is
 * always present: the status line must never crash, new releases add fields without
 * notice, and the entry point falls back to `{}` on unparsable input. JSDoc notes
 * record what the docs guarantee and when a field is absent or null.
 */
export interface StatusLineInput {
  /** Always present. Same value as `workspace.current_dir`, which is preferred. */
  cwd?: string;
  /** Always present. */
  session_id?: string;
  /** Custom name from `--name` or `/rename`, else the AI-generated title. Absent when neither exists. */
  session_name?: string;
  /** UUID of the prompt being processed. Absent until the first user input. */
  prompt_id?: string;
  /** Always present. */
  transcript_path?: string;
  /** Claude Code version. Always present. */
  version?: string;
  /** Whether the last response's total tokens exceed 200k, regardless of window size. */
  exceeds_200k_tokens?: boolean;
  fast_mode?: boolean;

  model?: {
    id?: string;
    display_name?: string;
  };

  workspace?: {
    current_dir?: string;
    /** Directory Claude Code was launched from. */
    project_dir?: string;
    /** Directories added via `/add-dir`. Empty array when none. */
    added_dirs?: string[];
    /** Linked worktree name. Absent in the main working tree. */
    git_worktree?: string;
    /** Parsed from the `origin` remote. Absent outside a repo or without `origin`. */
    repo?: {
      host?: string;
      /** For GitLab subgroups this is the full namespace path with slashes. */
      owner?: string;
      name?: string;
    };
  };

  output_style?: {
    name?: string;
  };

  cost?: {
    /** Client-side estimate at list price. Resets on `/clear`. */
    total_cost_usd?: number;
    total_duration_ms?: number;
    total_api_duration_ms?: number;
    total_lines_added?: number;
    total_lines_removed?: number;
  };

  context_window?: {
    /** Sum of input, cache creation and cache read tokens. 0 before the first response. */
    total_input_tokens?: number;
    total_output_tokens?: number;
    /** 200000 by default, 1000000 for extended-context models. */
    context_window_size?: number;
    /** Input-only percentage. May be null early in the session. */
    used_percentage?: number | null;
    remaining_percentage?: number | null;
    /** Null before the first API call and again right after `/compact`. */
    current_usage?: ContextUsage | null;
  };

  /** Absent until the main conversation's first API response. Requires v2.1.251+. */
  prompt_cache?: PromptCache;

  /** Absent when the model does not support the effort parameter. */
  effort?: {
    level?: EffortLevel;
  };

  thinking?: {
    enabled?: boolean;
  };

  /**
   * Only for claude.ai Pro/Max or behind a spend-limited gateway, and only after the
   * first API response. Each window may be independently absent and is dropped once
   * its `resets_at` passes.
   */
  rate_limits?: {
    five_hour?: RateLimitWindow;
    seven_day?: RateLimitWindow;
    spend_limit?: SpendLimit;
  };

  /** Present only when vim mode is enabled. */
  vim?: {
    mode?: VimMode;
  };

  /** Present only with `--agent` or agent settings. */
  agent?: {
    name?: string;
  };

  /** Open PR or GitLab MR for the current branch. Removed once it merges or closes. */
  pr?: {
    number?: number;
    url?: string;
    /** May be absent even when `pr` is present. */
    review_state?: PrReviewState;
    /** `mr` for a GitLab merge request. Absent for GitHub PRs. Requires v2.1.234+. */
    kind?: 'mr';
  };

  /** Present only while the session is in a worktree session. */
  worktree?: {
    name?: string;
    path?: string;
    /** Absent for hook-based worktrees. */
    branch?: string;
    original_cwd?: string;
    /** Absent for hook-based worktrees. */
    original_branch?: string;
  };
}

export type EffortLevel = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export type VimMode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'VISUAL LINE';

export type PrReviewState = 'approved' | 'pending' | 'changes_requested' | 'draft';

export interface ContextUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface RateLimitWindow {
  /** 0 to 100. */
  used_percentage?: number;
  /** Unix epoch seconds. */
  resets_at?: number;
}

/** Requires v2.1.251+; the dollar fields require v2.1.284+ and arrive on a slower schedule. */
export interface SpendLimit {
  /** 0 to 100, or above 100 once exceeded. */
  used_percentage?: number;
  /** Unix epoch seconds. */
  resets_at?: number;
  /** Gateway estimate, about five minutes behind `used_percentage`. */
  used_usd?: number;
  limit_usd?: number;
  period?: 'daily' | 'weekly' | 'monthly';
}

/** Prompt cache statistics for the main conversation. Timestamps are Unix epoch seconds. */
export interface PromptCache {
  /** Whether the cached prefix is still within its TTL. */
  warm?: boolean;
  /** Whether any response this session reported cache tokens. */
  caching_observed?: boolean;
  ttl?: '5m' | '1h';
  /** Null when the last response reported no cache tokens. */
  expires_at?: number | null;
  requests?: number;
  misses?: number;
  expected_rebuilds?: number;
  /** 0 to 1. Null while all token counts are zero. */
  hit_ratio?: number | null;
  cache_write_tokens?: number;
  miss_recache_tokens?: number;
  /** Null while the session has no misses. */
  last_miss_at?: number | null;
  /** Null until the first miss, or when no cause was identified. Requires v2.1.260+. */
  last_miss_cause?: CacheMissCause | null;
  /** Diagnosed misses per cause name. Requires v2.1.260+. */
  miss_causes?: Record<string, number>;
  /** Null right after a compaction until the next request. */
  recache_tokens_if_cold?: number | null;
}

export interface CacheMissCause {
  /** E.g. `tools_changed`, `system_prompt_changed`, `ttl_expired_5m`, `likely_server_side`. */
  causes?: string[];
  /** With `tools_changed`. */
  tools_added?: number;
  tools_removed?: number;
  /** With `system_prompt_changed`: change in system prompt length, in characters. */
  system_char_delta?: number;
}
