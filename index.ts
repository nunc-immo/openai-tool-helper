import { z, type ZodSchema } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type OpenAI from "openai";

export default function helper<T extends ZodSchema, U, R>(
  executor: (payload: U, params: z.infer<T>) => Promise<R>,
  environment: U,
  description: string,
  paramsSchema?: T | null
): Parameters<OpenAI.Beta.Chat.Completions["runTools"]>[0]["tools"][number] {
  return {
    type: "function",
    function: {
      name: executor.name,
      function: (params: z.infer<T>) => {
        console.log(params);
        return executor(environment, params);
      },
      // name: "updateUserSearchRequest",
      description,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      // parse: JSON.parse,
      parse: (json: string) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        paramsSchema
          ? paramsSchema.safeParse(JSON.parse(json))
          : JSON.parse(json),
      // @ts-expect-error undefined is not assignable to JsonSchema -> explicit type
      parameters: paramsSchema ? zodToJsonSchema(paramsSchema) : undefined,
    },
  };
}
