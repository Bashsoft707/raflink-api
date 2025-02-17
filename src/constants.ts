export enum NODE_ENV {
  DEV = 'development',
  STAGING = 'staging',
  PROD = 'production',
}

export enum ENV {
  NODE_ENV = 'NODE_ENV',
  SWAGGER_USER = 'Raflink',
  SWAGGER_PASSWORD = 'Raflink@2021',
  MONGO_URI = 'MONGO_URI',
  NODE_DEV = 'development',
  COMPANY_EMAIL = 'raflink@co.ng',
  REDIS_HOST = 'REDIS_HOST',
  REDIS_PORT = 'REDIS_PORT',
}

export enum TEMPLATES {
  WELCOME = 'WELCOME',
  VERIFY = 'VERIFY',
  OTP = 'OTP',
}

export enum OTPRELAX {
  RAFLINK_RELAX_OTP = 'XXIGNOREZX',
}

export enum CACHE_METADATA {
  OTP_SERVICE = 'OTP_SERVICE',
}
