import { debug } from 'debug'

export function getLogger(name: string) {
  return {
    debug: debug(`app:[DEBUG:${name}]`),
    info: debug(`app:[INFO:${name}]`),
    warn: debug(`app:[WARN:${name}]`),
    error: debug(`app:[WARN:${name}]`),
  }
}
