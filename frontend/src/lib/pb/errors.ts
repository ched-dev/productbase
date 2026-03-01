import isObject from "lodash/isObject";
import { ClientResponseError } from "pocketbase";

const UNKNOWN_ERROR_MESSAGE = 'An unknown error occurred.'
const VALIDATIONS_ERROR_MESSAGE = 'Invalid Data.'

/**
 * Validation error structure from Pocketbase (raw format)
 */
export interface ValidationErrorData {
  code: string;
  message: string;
}

type ErrorRemap = Record<string, string>

/**
 * ApiError class for handling Pocketbase API errors
 * Keeps validation errors in the original Pocketbase nested object format
 */
export class ApiError {
  name: string = 'ApiError';
  /** Top-level error message (e.g., "Failed to create record.") */
  message: string;
  /** HTTP status code (e.g., 400) */
  status: number;
  /** Raw validation errors from Pocketbase (field name -> error object) */
  validationData: Record<string, ValidationErrorData>;

  constructor(error: unknown, remapErrors: ErrorRemap = {}) {
    if (error instanceof ApiError) {
      this.message = error.message;
      this.status = error.status;
      this.validationData = { ...error.validationData };
    } else {
      // Try to extract data from ClientResponseError first
      const clientError = isObject(error) && error instanceof ClientResponseError
        ? error as ClientResponseError
        : undefined;

      if (clientError) {
        this.message = clientError.message;
        this.status = clientError.status;
        this.validationData = this._parseValidationErrors(clientError.response?.data);
      } else if (isObject(error) && error !== null) {
        // Handle plain error objects (e.g., from fetch responses)
        const err = error as Record<string, unknown>;
        this.message = typeof err.message === 'string' ? err.message : UNKNOWN_ERROR_MESSAGE;
        this.status = typeof err.status === 'number' ? err.status : 500;
        this.validationData = this._parseValidationErrors(err.data as Record<string, unknown> | undefined);
      } else {
        // Can't parse the error
        this.message = UNKNOWN_ERROR_MESSAGE;
        this.status = 500;
        this.validationData = {};
      }
    }

    // re-map error messages
    const remappedErrors: ErrorRemap = {
      'Failed to create record.': VALIDATIONS_ERROR_MESSAGE,
      ...remapErrors
    }
    if (this.message in remappedErrors) {
      this.message = remappedErrors[this.message]
    }

    return this
  }

  /**
   * Parse validation errors from response data into a Record
   */
  private _parseValidationErrors(data: Record<string, unknown> | undefined): Record<string, ValidationErrorData> {
    const result: Record<string, ValidationErrorData> = {};

    if (!data || typeof data !== 'object') {
      return result;
    }

    for (const [field, errorObj] of Object.entries(data)) {
      if (isObject(errorObj) && errorObj !== null) {
        const err = errorObj as Record<string, unknown>;
        if (typeof err.code === 'string' && typeof err.message === 'string') {
          result[field] = {
            code: err.code,
            message: err.message,
          };
        }
      }
    }

    return result;
  }

  /**
   * Check if there are any validation errors
   * @returns true if there are validation errors, false otherwise
   */
  hasValidationErrors(): boolean {
    return Object.keys(this.validationData).length > 0;
  }

  /**
   * Check if a specific field has a validation error
   * @param fieldName - The field name to check
   * @returns true if the field has a validation error, false otherwise
   */
  hasValidationError(fieldName: string): boolean {
    return fieldName in this.validationData;
  }

  /**
   * Get all validation errors as a record object
   * @returns Record of field names to error objects
   */
  validationErrors(): Record<string, ValidationErrorData> {
    return { ...this.validationData };
  }

  /**
   * Get a specific field's validation error
   * @param fieldName - The field name to look up
   * @returns The validation error object or undefined if not found
   */
  validationError(fieldName: string): ValidationErrorData | undefined {
    return this.validationData[fieldName];
  }
}

/**
 * Get an ApiError instance from the Pocketbase API response
 * @param error - The error from Pocketbase (usually ClientResponseError)
 * @param remapErrors - Map of error messages to change
 * @returns ApiError instance
 */
export function getApiError(error: unknown, remapErrors: ErrorRemap = {}): ApiError {
  return new ApiError(error, remapErrors);
}
