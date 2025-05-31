import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
  
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
  
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        message = typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse as any).message || exception.message;
      } else if (exception instanceof PrismaClientKnownRequestError) {
        // Handle Prisma errors
        switch (exception.code) {
          case 'P2002':
            status = HttpStatus.CONFLICT;
            message = 'Unique constraint violation';
            break;
          case 'P2025':
            status = HttpStatus.NOT_FOUND;
            message = 'Record not found';
            break;
          default:
            status = HttpStatus.BAD_REQUEST;
            message = 'Database operation failed';
        }
      } else if (exception instanceof Error) {
        message = exception.message;
      }
  
      const errorResponse = {
        status: 'error',
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
  
      // Log the error
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
  
      response.status(status).json(errorResponse);
    }
  }