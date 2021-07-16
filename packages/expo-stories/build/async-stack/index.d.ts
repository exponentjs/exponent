declare const appStack: import("./types").IStack<import("./stack").IScreen>;
declare function StackContainer({ children }: any): JSX.Element;
export { StackContainer, appStack as Stack };
