import 'reflect-metadata';

export function NoHandler() {
  return (target: object) => {
    Reflect.defineMetadata('noHandler', null, target);
  };
}
