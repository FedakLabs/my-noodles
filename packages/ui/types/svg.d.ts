declare module '@my-noodles/ui/icons/*.svg' {
  import type { FC } from 'react';

  import type { SvgIconProps } from './svg-icon-props';

  const ReactComponent: FC<SvgIconProps>;
  export default ReactComponent;
}

declare module '*.svg' {
  import type { FC } from 'react';

  import type { SvgIconProps } from './svg-icon-props';

  const ReactComponent: FC<SvgIconProps>;
  export default ReactComponent;
}
