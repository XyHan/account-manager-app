import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { ContainerInterface } from '../../service/container.interface';

@Injectable()
export class ModuleRefAdapter implements ContainerInterface {
  constructor(private readonly moduleRef: ModuleRef) {}

  get(service: unknown): unknown {
    return this.moduleRef.get(service as Parameters<ModuleRef['get']>[0], { strict: false });
  }
}
