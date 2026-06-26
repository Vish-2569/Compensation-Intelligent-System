/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class ApiError extends Error {
  status: number;
  info?: any;

  constructor(message: string, status: number, info?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
    
    // Fix the prototype chain explicitly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
