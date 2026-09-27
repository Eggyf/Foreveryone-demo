import './Message.css';

export type MessageTone = 'error' | 'success' | 'info' | 'neutral';

interface MessageProps {
  tone?: MessageTone;
  children: React.ReactNode;
}

/**
 * Aviso en linea para resultados de una accion. El tono marca visualmente si
 * es un fallo o una confirmacion, y el rol permite que un lector de pantalla
 * anuncie los errores de forma inmediata y las confirmaciones de forma suave.
 */
export const Message = ({ tone = 'neutral', children }: MessageProps) => (
  <p
    className={`message message--${tone}`}
    role={tone === 'error' ? 'alert' : 'status'}
  >
    {children}
  </p>
);
