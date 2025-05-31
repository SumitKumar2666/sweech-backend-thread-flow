import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import {
  CommentsController,
  CommentManagementController,
} from './comments.controller';

@Module({
  controllers: [CommentsController, CommentManagementController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
