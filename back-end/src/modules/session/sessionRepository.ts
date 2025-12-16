import { prisma } from "../../shared/database/prisma";
import dayjs from "dayjs"; // npm install dayjs

export class SessionRepository {
  async saveRefreshToken(userId: string, token: string) {
    const expiracao = dayjs().add(7, "day").toDate();

    return prisma.refreshToken.create({
      data: {
        id_usuario: userId,
        token,
        expiracao,
        ativo: true,
      },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteUserTokens(userId: string) {
    // Remove tokens antigos do usuário para evitar acúmulo
    return prisma.refreshToken.deleteMany({
      where: { id_usuario: userId },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.deleteMany({
      where: { token },
    });
  }
}
