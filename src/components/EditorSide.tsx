import * as React from 'react';
import { signal, slot } from './emitter';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Menu from './menus/Menu';
import { LangProps, ProgLangProps } from './Props';
import ContainerDimensions from 'react-container-dimensions';
import Editor from './Editor';
import Console from './Console';
import FileForm from './FileForm';
import { PageHeader } from 'antd';

type Props = LangProps & ProgLangProps;

interface State {
  step: number;
}

export default class EditorSide extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { step: 0 };
    this.onStepChange = this.onStepChange.bind(this);
  }
  onStepChange = (step: number) => {
    this.setState({ step: step });
    signal('jumpTo', step);
  };

  render() {
    return (
      <Row>
        <PageHeader className="site-page-header" title="Civis" />
        <Col lg={12} md={12} sm={12} xs={12}>
          <ContainerDimensions>
            {({ width, height }: { width: number; height: number }) => (
              <Editor
                lang={this.props.lang}
                progLang={this.props.progLang}
                width={width}
                height={height}
              />
            )}
          </ContainerDimensions>
        </Col>
        <Col lg={12} md={12} sm={12} xs={12}>
          <Console lang={this.props.lang} />
        </Col>
        {/* <Col lg={12} md={12} sm={12} xs={12}>
          <FileForm lang={this.props.lang} />
        </Col> */}
      </Row>
    );
  }
}
