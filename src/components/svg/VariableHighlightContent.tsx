import * as React from 'react';
import ColorPicker from 'rc-color-picker';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Cascader, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MDBCard, MDBCardBody, MDBRow, MDBCol } from 'mdb-react-ui-kit';

interface Props {
  variablesHighlight: any;
  options: any;
}

interface State {}

export default class VariablesHighlightContent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { variablesHighlight, options } = this.props;
    return (
      <div>
        <h4>Highlight Variables</h4>
        <MDBRow style={{ height: 32 }}>
          <MDBCol size="9">
            <Cascader options={options}></Cascader>
          </MDBCol>
          <MDBCol size="2" style={{ maginLeft: -10 }}>
            <Button type="primary" icon={<PlusOutlined />}></Button>
          </MDBCol>
        </MDBRow>
        <PerfectScrollbar>
          <div style={{ height: 68 }}>
            {variablesHighlight.map((m, i) => {
              return (
                <MDBCard
                  style={{
                    marginTop: 5,
                    marginBottom: 5,
                    width: '90%',
                    left: '5%',
                  }}
                >
                  <MDBCardBody style={{ padding: 5 }}>
                    <MDBRow>
                      <MDBCol size="8">
                        <span>{m['function']}</span>
                        <span>: </span>
                        <span>{m['name']}</span>
                      </MDBCol>
                      <MDBCol size="4">
                        <ColorPicker color={m['color']} />
                      </MDBCol>
                    </MDBRow>
                  </MDBCardBody>
                </MDBCard>
              );
            })}
            <div style={{ height: 1 }}></div>
          </div>
        </PerfectScrollbar>
      </div>
    );
  }
}
