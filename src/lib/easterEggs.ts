/** Mensagens que objetos da cena 3D mostram na área de trabalho (caixa "Luz 95"). */
export const SCENE_MESSAGES = {
  light: 'Talvez você precise de um pouco mais de Luz.',
  coffee: 'Quem não ama um café quente?',
  cleanCode: 'Ainda temos muito o que estudar, não é?',
} as const;

export type SceneMessage = { text: string; /** pisca a tela antes da mensagem */ flicker?: boolean };

/** Evento na janela: a cena (Canvas) e a área de trabalho (DOM) não compartilham estado. */
export const SCENE_MESSAGE_EVENT = 'luz95:mensagem';

export function showSceneMessage(message: SceneMessage) {
  window.dispatchEvent(new CustomEvent<SceneMessage>(SCENE_MESSAGE_EVENT, { detail: message }));
}
