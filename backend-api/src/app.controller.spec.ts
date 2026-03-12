import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('getRoot returns service info', () => {
      const res = appController.getRoot();
      expect(res).toHaveProperty('status', 'ok');
      expect(res).toHaveProperty('service', 'NestConnect API');
    });
  });

  describe('health', () => {
    it('getHealth returns ok with timestamp', () => {
      const res = appController.getHealth();
      expect(res).toHaveProperty('status', 'ok');
      expect(res).toHaveProperty('timestamp');
    });
  });
});
