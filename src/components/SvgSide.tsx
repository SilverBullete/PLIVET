import * as React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Svg from './svg/Svg';
import ContainerDimensions from 'react-container-dimensions';
import { LangProps } from './Props';

type Props = LangProps;

interface State {
  scale: number;
}


export default class SvgSide extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { scale: 1.0 };
    this.onScaleChange = this.onScaleChange.bind(this);
  }
  onScaleChange = (scale: number) => {
    this.setState({ scale });
  };
  render() {
    return (
      <Row ref="canvasContainer">
        <Col lg={11} md={11} sm={11} xs={11}>
        </Col>
        <Col lg={1} md={1} sm={1} xs={1}>
          {/* <ThemeButton lang={this.props.lang} /> */}
        </Col>
        <Col lg={12} md={12} sm={12} xs={12}>
          <ContainerDimensions>
            {({ width, height }: { width: number; height: number }) => (
              <Svg width={width} height={height} scale={this.state.scale} />
            )}
          </ContainerDimensions>
        </Col>
      </Row>
    );
  }
}
