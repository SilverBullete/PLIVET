import * as React from 'react';
import ColorPicker from 'rc-color-picker';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Cascader, Button } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { MDBCard, MDBCardBody, MDBRow, MDBCol } from 'mdb-react-ui-kit';

interface Props {
  variablesHighlight: any;
  options: any;
  addVariableHighlight: any;
  changeVariableColor: any;
  changeVariableVisible: any;
  removeVariableHighlight: any;
}

interface State {
  funcName: any;
  varName: any;
}

export default class VariablesHighlightContent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
  }

  onChange(_this, value) {
    _this.setState({ funcName: value[0], varName: value[1] });
  }

  render() {
    const {
      variablesHighlight,
      options,
      addVariableHighlight,
      changeVariableColor,
      changeVariableVisible,
      removeVariableHighlight,
    } = this.props;
    const variablesMap = {};
    variablesHighlight.map((m) => {
      variablesMap[`${m['function']}_${m['name']}`] = {
        color: m['color'],
        visible: m['visible'],
      };
    });
    sessionStorage.setItem('variablesMap', JSON.stringify(variablesMap));
    return (
      <div>
        <h4>Highlight Variables</h4>
        <MDBRow style={{ height: 32 }}>
          <MDBCol size="9">
            <Cascader
              options={options}
              onChange={(value) => {
                this.setState({ funcName: value[0], varName: value[1] });
              }}
            ></Cascader>
          </MDBCol>
          <MDBCol size="2" style={{ maginLeft: -10 }}>
            <Button
              type="primary"
              onClick={() => {
                addVariableHighlight(this.state.funcName, this.state.varName);
              }}
              icon={<PlusOutlined />}
            ></Button>
          </MDBCol>
        </MDBRow>
        <PerfectScrollbar>
          <div style={{ height: 108 }}>
            {variablesHighlight.map((m, i) => {
              function changeHandler(color) {
                changeVariableColor(m['function'], m['name'], color.color);
              }
              function changeVisible() {
                changeVariableVisible(m['function'], m['name']);
              }
              function removeHandler() {
                removeVariableHighlight(m['function'], m['name']);
              }

              return (
                <MDBCard
                  style={{
                    marginTop: 5,
                    marginBottom: 5,
                    width: '90%',
                    left: '5%',
                  }}
                  border={m['visible'] ? 'info' : ''}
                >
                  <MDBCardBody style={{ padding: 5 }}>
                    <MDBRow>
                      <MDBCol size="8" onClick={changeVisible}>
                        <span>{m['function']}</span>
                        <span>: </span>
                        <span>{m['name']}</span>
                      </MDBCol>
                      <MDBCol size="2">
                        <ColorPicker
                          color={m['color']}
                          onChange={changeHandler}
                        />
                      </MDBCol>
                      <MDBCol size="1">
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<CloseOutlined />}
                          size="small"
                          style={{ height: 18, width: 18, minWidth: 18 }}
                          onClick={removeHandler}
                        />
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
