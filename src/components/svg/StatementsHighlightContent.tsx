import * as React from 'react';
import ColorPicker from 'rc-color-picker';
import PerfectScrollbar from 'react-perfect-scrollbar';

import {
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit';

interface Props {
  statementsHighlight: any;
  changeStatementColor: any;
}

interface State {}

export default class StatementsHighlightContent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
  }

  onChangeColor(colors) {
    console.log(this);
  }

  render() {
    const { statementsHighlight, changeStatementColor } = this.props;

    return (
      <div>
        <h4>Highlight Statements</h4>
        <div></div>
        <PerfectScrollbar>
          <div style={{ height: 100 }}>
            {statementsHighlight.map((m, i) => {
              function changeHandler(color) {
                console.log(color);

                changeStatementColor(m['lineNumber'], color.color);
              }
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
                        <span>Line number: </span>
                        <span>{m['lineNumber']}</span>
                      </MDBCol>
                      <MDBCol size="4">
                        <ColorPicker
                          color={m['color']}
                          onChange={changeHandler}
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
