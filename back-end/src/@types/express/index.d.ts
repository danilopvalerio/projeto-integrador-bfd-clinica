import { TokenPayload } from "../../modules/session/sessionDTO";

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}
