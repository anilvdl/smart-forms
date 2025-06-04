import { FastifyPluginAsync } from "fastify";
import { PostgresAdapter } from "@smartforms/lib-db/adapter";
import type {
  Adapter,
  AdapterUser,
  AdapterAccount,
  AdapterSession,
} from "next-auth/adapters";

// Tell TS that PostgresAdapter() implements every Adapter method
const adapter = PostgresAdapter() as Required<Adapter>;

const authRoutes: FastifyPluginAsync = async (app) => {
  // ── Users ─────────────────────────────────────────────────────────
  app.post<{ Body: Omit<AdapterUser, "id"> }>("/users", async (req, reply) => {
    try {
      const user = await adapter.createUser(req.body);
      reply.code(201).send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "CREATE_USER_FAILED", message: "Could not create user" } });
    }
  });

  app.get<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
    try {
      const user = await adapter.getUser(req.params.id);
      if (!user) {
        return reply
          .code(404)
          .send({ error: { code: "USER_NOT_FOUND", message: "User not found" } });
      }
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "GET_USER_FAILED", message: "Could not fetch user" } });
    }
  });

  app.get<{ Querystring: { email: string } }>("/users", async (req, reply) => {
    try {
      const user = await adapter.getUserByEmail(req.query.email);
      if (!user) {
        return reply
          .code(404)
          .send({ error: { code: "USER_NOT_FOUND", message: "User not found" } });
      }
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({
          error: { code: "GET_USER_BY_EMAIL_FAILED", message: "Could not fetch user by email" },
        });
    }
  });

  app.get<{
    Querystring: { provider: string; providerAccountId: string };
  }>("/users/by-account", async (req, reply) => {
    try {
      const user = await adapter.getUserByAccount({
        provider: req.query.provider,
        providerAccountId: req.query.providerAccountId,
      });
      if (!user) {
        return reply
          .code(404)
          .send({ error: { code: "ACCOUNT_NOT_LINKED", message: "No user for that account" } });
      }
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({
          error: { code: "GET_USER_BY_ACCOUNT_FAILED", message: "Could not fetch user by account" },
        });
    }
  });

  app.put<{ Params: { id: string }; Body: Partial<AdapterUser> }>("/users/:id", async (req, reply) => {
    try {
      const user = await adapter.updateUser({ id: req.params.id, ...req.body });
      reply.send(user);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "UPDATE_USER_FAILED", message: "Could not update user" } });
    }
  });

  app.delete<{ Params: { id: string } }>("/users/:id", async (req, reply) => {
    try {
      await adapter.deleteUser(req.params.id);
      reply.code(204).send();
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "DELETE_USER_FAILED", message: "Could not delete user" } });
    }
  });

  // ── Accounts ────────────────────────────────────────────────────────
  app.post<{ Body: AdapterAccount }>("/accounts", async (req, reply) => {
    try {
      await adapter.linkAccount(req.body);
      reply.code(201).send();
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "LINK_ACCOUNT_FAILED", message: "Could not link account" } });
    }
  });

  app.delete<{
    Querystring: { provider: string; providerAccountId: string };
  }>("/accounts", async (req, reply) => {
    try {
      await adapter.unlinkAccount({
        provider: req.query.provider,
        providerAccountId: req.query.providerAccountId,
      });
      reply.code(204).send();
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "UNLINK_ACCOUNT_FAILED", message: "Could not unlink account" } });
    }
  });

  // ── Sessions ────────────────────────────────────────────────────────
  app.post<{ Body: AdapterSession }>("/sessions", async (req, reply) => {
    try {
      const sess = await adapter.createSession(req.body);
      reply.code(201).send(sess);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "CREATE_SESSION_FAILED", message: "Could not create session" } });
    }
  });

  app.get<{ Params: { sessionToken: string } }>("/sessions/:sessionToken", async (req, reply) => {
    try {
      const sessUser = await adapter.getSessionAndUser(req.params.sessionToken);
      if (!sessUser) {
        return reply
          .code(404)
          .send({ error: { code: "SESSION_NOT_FOUND", message: "Session not found" } });
      }
      reply.send(sessUser);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({
          error: { code: "GET_SESSION_FAILED", message: "Could not fetch session and user" },
        });
    }
  });

  app.put<{
    Params: { sessionToken: string };
    Body: Partial<AdapterSession>;
  }>("/sessions/:sessionToken", async (req, reply) => {
    try {
      const updated = await adapter.updateSession({
        sessionToken: req.params.sessionToken,
        ...req.body,
      });
      reply.send(updated);
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "UPDATE_SESSION_FAILED", message: "Could not update session" } });
    }
  });

  app.delete<{ Params: { sessionToken: string } }>("/sessions/:sessionToken", async (req, reply) => {
    try {
      await adapter.deleteSession(req.params.sessionToken);
      reply.code(204).send();
    } catch (err) {
      req.log.error(err);
      reply
        .code(500)
        .send({ error: { code: "DELETE_SESSION_FAILED", message: "Could not delete session" } });
    }
  });
};

export default authRoutes;
