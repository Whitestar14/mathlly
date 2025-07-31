// Define error interface
export interface RouteError {
  message: string;
  status?: number;
  originalError?: Error;
}
