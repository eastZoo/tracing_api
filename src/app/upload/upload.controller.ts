import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import axios from 'axios';
import * as FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Controller('upload')
export class UploadController {
  @Post(':project')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Param('project') project: string) {
    // 원격 파일 서버의 업로드 엔드포인트
    const uploadUrl = `${process.env.FILE_SERVER_API}/${project}`;

    // 파일 확장자 추출
    const fileExtName = path.extname(file.originalname);

    // UUID로 파일 이름 생성
    const uniqueFilename = `${uuidv4()}${fileExtName}`;

    // 폼 데이터 생성
    const formData = new FormData();
    formData.append('file', file.buffer, uniqueFilename); // 변경된 파일 이름 사용
    formData.append('originalName', file.originalname); // 원본 파일 이름 추가

    try {
      // 원격 파일 서버로 파일 업로드
      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          // 필요한 경우 인증 헤더 추가
          // 'Authorization': 'your_secret_token',
        },
      });

      // 응답 반환 (원본 파일 이름과 저장된 경로 포함)
      return {
        message: 'File uploaded successfully',
        originalName: file.originalname,
        filename: uniqueFilename,
        path: response.data.path,
      };
    } catch (error) {
      console.error('File upload error:', error.message);
      throw error;
    }
  }
}
