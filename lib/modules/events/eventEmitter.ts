class EventEmitter {
  private static connections = new Map<string, WritableStreamDefaultWriter>();

  public static addConnection(id: string, writer: WritableStreamDefaultWriter) {
    this.connections.set(id, writer);
  }

  public static removeConnection(id: string) {
    this.connections.delete(id);
  }

  public static async emit(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify({ data })}\n\n`;
    const encoder = new TextEncoder();

    Array.from(this.connections.entries()).forEach(async ([id, writer]) => {
      try {
        await writer.write(encoder.encode(message));
      } catch (error) {
        console.error(`Failed to send message to connection ${id}:`, error);
        this.removeConnection(id);
      }
    });
  }
}

export default EventEmitter;