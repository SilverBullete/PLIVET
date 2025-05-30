import * as React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import EditorSide from './EditorSide';
import SvgSide from './SvgSide';
import { LangProps, ProgLangProps, ThemeProps } from './Props';
import '../css/theme.css';
import 'antd/dist/antd.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
type Props = LangProps & ProgLangProps & ThemeProps;

interface State {}

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    sessionStorage.clear();
  }
  render() {
    const { lang, progLang, theme } = this.props;
    return (
      <Grid fluid={true}>
        <Row style={{ margin: '0px' }}>
          <Col
            md={3}
            className={theme === 'light' ? 'theme-light' : 'theme-gray'}
          >
            <EditorSide lang={lang} progLang={progLang} />
          </Col>
          <Col
            md={9}
            className={theme === 'light' ? 'theme-light' : 'theme-gray'}
          >
            <SvgSide lang={lang} />
          </Col>
        </Row>
        {/* <Footer fromYear={2018} /> */}
      </Grid>
    );
  }
}
