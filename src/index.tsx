import { Hono } from "hono";
import type { FC } from "hono/jsx";

const app = new Hono();

const Top: FC<{ messages: string[] }> = (props: { messages: string[] }) => {
  return (
    <main>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>;
        })}
      </ul>
    </main>
  );
};

app.get("/", (c) => {
  const messages = ["hello", "world"];
  return c.html(<Top messages={messages} />);
});

export default {
  port: 4000,
  fetch: app.fetch, 
};
