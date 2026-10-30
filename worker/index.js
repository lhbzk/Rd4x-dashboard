export default {
  async fetch() {
    return new Response("RD4X WORKER OK", {
      headers: {
        "Content-Type": "text/plain"
      }
    });
  }
};
