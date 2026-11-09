import { sdk } from '../sdk'
import { manageAccess } from './manageAccess'

export const actions = sdk.Actions.of().addAction(manageAccess)
