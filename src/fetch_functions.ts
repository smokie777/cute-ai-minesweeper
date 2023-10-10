export const fetch_post = async(route:string, body = {}) => {
  const res = await fetch(route, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data;
};

export const fetch_post_vtuber_speak = (prompt:string) => fetch_post(
  '/receive_prompt',
  {
    prompt,
    priority: 'priority_game_input'
  }
);
