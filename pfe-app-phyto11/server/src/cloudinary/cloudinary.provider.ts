import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

cloudinary.config({
  cloud_name: 'dsiekn5sr',
  api_key: '375628986862568',
  api_secret: 'Vn5D7rzX-cRhuHU5qAYVu8q_92g',
});

export { cloudinary };
