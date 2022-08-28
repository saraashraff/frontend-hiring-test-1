import React, { Component } from "react";
import { Container } from "./styles";
import MissedCall from "../../assets/img/phone-call.svg";
import CallService from "../../services/CallService";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Loading from "../../assets/gifs/loader.gif";
import arrowDown from "../../assets/img/arrow-down.svg";
import arrowUp from "../../assets/img/arrow-up.svg";
import Pagination from "react-js-pagination";
import TuringLogo from "../../assets/img/turing.svg";
import { Table } from "react-bootstrap";


export interface Note {
  id: string;
  content: string;
}

export interface Call {
  call_type: string;
  created_at: string;
  direction: string;
  duration: number;
  from: string;
  id: string;
  is_archived: boolean;
  notes: Note[];
  to: string;
  via: string;
}

export interface RequestState {
  [key: string]: any;
  values: Call[];
  submitSuccess: boolean;
  loading: boolean;
  offset?: any;
  limit?: any;
  totalCount: number;
  hasNextPage: boolean;
  detail: boolean;
  types_call: string[];
  type_call: string;
  group_call: [];
}

class Calls extends React.Component<RouteComponentProps, RequestState> {
  listOfCalls: string[] = [];
  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      call_type: "",
      created_at: "",
      direction: "",
      duration: 0,
      from: "",
      id: "",
      is_archived: false,
      notes: [],
      to: "",
      via: "",
      values: [],
      submitSuccess: false,
      loading: false,
      offset: 1,
      limit: 30,
      totalCount: 1,
      hasNextPage: true,
      detail: false,
      types_call: [],
      type_call: "All",
      group_call: [],
    };
  }
  async componentDidMount() {
   await this.getCalls();
  }

 async getCalls() {
    this.setState({ loading: true });
    const request = new CallService();
    try{
     await request.getCalls(this.state.offset, this.state.limit).then(
        (success) => {
          this.setState({
            submitSuccess: true,
            values: success.nodes,
            hasNextPage: success.hasNextPage,
            totalCount: success.totalCount,
            loading: false
          });
          this.onlyUniqueTypeCall();
          this.setGroupCallValues();
        })
    }catch(e){
      console.log(e);
        this.setState({ loading: false, submitSuccess: false });
    }
  }

  // filtering calls depending on call type
  onlyUniqueTypeCall() {
    let arrayTemp: string[] = [];
    let valueState = this.state;
    for (let item of valueState.values) {
      if (!arrayTemp.includes(item.call_type)) {
        arrayTemp.push(item.call_type);
      }
      this.setState({ types_call: arrayTemp });
    }
  }

  async handleTypeCallChange(value: any) {
   await this.setState({ type_call: value });
    this.setGroupCallValues();
  }

  // function which sets the state of a call i.e. archived or inarchived
  archiveCall(id: string) {
    this.setState({ loading: true, submitSuccess: false });
    const request = new CallService();
    request.updateCalls(id).then(
      () => {
        this.setState({ loading: false, submitSuccess: true });
        this.getCalls();
      },
      (error) => {
        this.setState({ loading: false, submitSuccess: true });
      }
    );
  }

  //handling pagination
  async handlePageChange(pageNumber: number) {
   await this.setState({ offset: pageNumber });
    this.getCalls();
  }

  //showing call details on click of arrow
  toggleDetailCall(id: any) {
    if (this.listOfCalls.includes(id)) {
      this.removeArray(id);
    } else {
      this.listOfCalls.push(id);
      this.setState({ detail: true });
    }
    this.forceUpdate();
  }

  //removing a call from its list
  removeArray(element: any) {
    const index = this.listOfCalls.indexOf(element);

    if (index !== -1) {
      this.listOfCalls.splice(index, 1);
    }
    this.setState({ detail: false });
  }

    // grouping calls according to date
   setGroupCallValues = async()  => {
    let groupBy = this.groupBy(this.state.values);
    await this.setState({ group_call: groupBy });
  }

  groupBy = (xs: Call[]) => {
    return xs.reduce((rv: any, x: any) => {
      (this.state.type_call !== 'All' ? x.call_type === this.state.type_call : x) &&
     (rv[new Date(x.created_at).toLocaleDateString()] =
     rv[new Date(x.created_at).toLocaleDateString()] || []).push(x);
      return rv;
    }, {});
  };

  render() {
    const { loading } = this.state;
    return (
      <Container>
        <div className="content">
          {loading ? (
            <div className="loading">
              <img src={Loading} width="100" />
            </div>
          ) : (
            <div className="calls">


              <div>  <img src={TuringLogo} alt="" width="300" /> 
              <br></br>
              <hr></hr>
              <h3> Turing Technologies Frontend Test</h3>
              </div>
              {Object.entries(this.state.group_call)
                .sort().map(([key, value]) => (
                  <div>
                    {/* <p> Filter by Status:</p> */}
                  <select value={this.state.type_call} name="call_type" id="call_type" onChange={e => this.handleTypeCallChange(e.target.value)}>
                    <option value="All">Filter by Status</option>
                    {this.state.types_call.map((type, key) =>
                    <option key={key} value={type}>{type}</option>
                    )}
                  </select>
                  
                  <div className="group-call">
                  <div className="key">
                    <hr/>
                   <span>
                   {key}
                  </span>
                  <hr/>
                  <br></br>
                 
                  </div>  
                    {Object(value).map((item: any) => (
                      
                      <div className="call" key={item.id}>
                         <div>
                         <Table striped bordered hover variant="dark">
                          <thead>
                            <tr>
                              <th>Call Type</th>
                              <th>Direction</th>
                              <th>Duration</th>
                              <th>From</th>
                              <th>To</th>
                              <th>Via</th>
                              <th>Created At</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td> <span>{item.call_type}</span></td>
                              <td><span>{item.direction}</span></td>
                              <td><span>{item.duration} seconds</span></td>
                              <td><span>{item.from}</span></td>
                              <td><span>{item.to}</span></td>
                              <td><span>{item.via}</span></td>
                              <td>
                                <span className="time">
                                  {new Date(item.created_at).toLocaleTimeString()}
                                </span>
                              </td>
                              <td><span>{item.is_archived ? "Archived" : "Unarchived"} </span></td>
                              
                            </tr>
                            
                          </tbody>
                        </Table> </div>
                        
                        <div className="call-info">
                          {/* <span>To: {item.to}</span> */}
                          <span></span>
                            <button onClick={(e) => this.archiveCall(item.id)}>
                             {item.is_archived ? 'Unarchive' : 'Archive'} 
                            </button>
                        </div>
                        
                        {this.listOfCalls.includes(item.id) ? (
                          <div className="detail">
                            <hr />
                            <div className="card">
                            
                              <div className="description">
                                <span className="title">Notes: </span>
                                {item.notes.length >= 1 ? (
                                  item.notes.map((note: any, key: any) => (
                                    <span key={key}>{note.content}</span>
                                  ))
                                ) : (
                                  <span>No notes</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null}
                        <div className="footer">
                          <img
                            onClick={(e) => this.toggleDetailCall(item.id)}
                            src={
                              this.listOfCalls.includes(item.id)
                                ? arrowUp
                                : arrowDown
                            }
                            alt=""
                            width="12"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                ))}
              <Pagination
                activePage={this.state.offset}
                itemsCountPerPage={this.state.limit}
                totalItemsCount={this.state.totalCount}
                pageRangeDisplayed={3}
                onChange={this.handlePageChange.bind(this)}
              />
            </div>
          )}
        </div>
      </Container>
    );
  }
}

export default withRouter(Calls);
