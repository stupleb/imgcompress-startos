import { sdk } from '../sdk'
import { configureLimits } from './configureLimits'
import { manageAccess } from './manageAccess'

export const actions = sdk.Actions.of()
  .addAction(manageAccess)
  .addAction(configureLimits)
