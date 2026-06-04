import { Document, Model, model, models, Schema } from 'mongoose'

export interface IRouteRateLimit extends Document {
  key: string
  route: string
  count: number
  windowStartedAt: Date
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

const routeRateLimitSchema = new Schema<IRouteRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    route: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    windowStartedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
)

routeRateLimitSchema.index({ route: 1, windowStartedAt: 1 })
routeRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const RouteRateLimit =
  (models.RouteRateLimit as Model<IRouteRateLimit>) ||
  model<IRouteRateLimit>('RouteRateLimit', routeRateLimitSchema)

export default RouteRateLimit
