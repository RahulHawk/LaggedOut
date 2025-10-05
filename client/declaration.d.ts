declare module 'react-slick' {
  import * as React from 'react';

  class Slider extends React.Component<any> {
    slickNext(): void;
    slickPrev(): void;
    slickGoTo(slideNumber: number): void;
  }

  export default Slider;
}