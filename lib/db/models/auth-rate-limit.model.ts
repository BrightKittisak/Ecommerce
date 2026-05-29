import { Document, Model, model, models, Schema } from 'mongoose'

export interface IAuthRateLimit extends Document {
  key: string
  scope: 'email' | 'ip'
  attempts: number
  firstAttemptAt: Date
  lastAttemptAt: Date
  blockedUntil?: Date
  createdAt: Date
  updatedAt: Date
}

const authRateLimitSchema = new Schema<IAuthRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    scope: { type: String, enum: ['email', 'ip'], required: true },
    attempts: { type: Number, required: true, default: 0 },
    firstAttemptAt: { type: Date, required: true },
    lastAttemptAt: { type: Date, required: true },
    blockedUntil: { type: Date },
  },
  {
    timestamps: true,
  }
)

authRateLimitSchema.index({ blockedUntil: 1 })
authRateLimitSchema.index({ lastAttemptAt: 1 }, { expireAfterSeconds: 86400 })

const AuthRateLimit =
  (models.AuthRateLimit as Model<IAuthRateLimit>) ||
  model<IAuthRateLimit>('AuthRateLimit', authRateLimitSchema)

export default AuthRateLimit
