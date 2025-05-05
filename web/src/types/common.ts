export type ThemeMode = "light" | "dark" | "system"

export interface PaginationParams {
  page: number
  limit: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export type TimeFrame = "1d" | "7d" | "30d" | "all"
