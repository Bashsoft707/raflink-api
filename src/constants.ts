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
  SMTP_HOST = 'SMTP_HOST',
  SMTP_PASS = 'SMTP_PASS',
  SMTP_PORT = 'SMTP_PORT',
  SMTP_USER = 'SMTP_USER',
  SMTP_SECURE = 'SMTP_SECURE',
  EMAIL_FROM = 'EMAIL_FROM',
}

export enum TEMPLATES {
  WELCOME = 'WELCOME',
  VERIFY = 'VERIFY',
  OTP = 'OTP',
  ONBOARDING = 'ONBOARDING',
}

export enum OTPRELAX {
  RAFLINK_RELAX_OTP = 'XXIGNOREZX',
}

export enum CACHE_METADATA {
  OTP_SERVICE = 'OTP_SERVICE',
}
