import React from 'react';
import { nest } from 'd3';
import QuestionGroups from './components/QuestionGroups';
import Charts from './components/Charts';
import './App.scss';

export default class App extends React.Component {
  constructor(props){

    super(props);

    // empty state
    this.state = {
      questionGroups: [],
      responses: {},
      questions: {},
      isFetching: false,
      data: {},
      activeQuestionIds: null,
      activeDemographic: null,
      activeQuestionGroup: null
    }

    let qry = {
      question_id__in: props.questionIds,
      demographic_key__in: props.demographicKeys,
      group_by: ['question_id', 'demographic_value'],
      metadata: true
    }

    this.fetchData(qry);
  }


  fetchData = (qry={}, cb=()=>{}) => {
    let url = new URL('https://chart-studio.herokuapp.com/api/v1/projects/5b04194ca5783e1275b0ab89/data');
    for(let k in qry){
      if(qry[k] instanceof Array)
        qry[k].forEach((q)=> url.searchParams.append(`${k}[]`, q));
      else
        url.searchParams.append(k, qry[k])
    }

    fetch(url.toString())
      .then((res)=>(
        res.json()
      )).then((data)=>{
        // set state
        this.setState({
          responses: data.metaData.response_id,
          questions: data.metaData.question_id,
          data: data.data
        });
        cb();
      });
  }

  render(){

    return(
      <div class="varying-degrees-2018">
        <Charts questions={this.state.questions}
          responses={this.state.responses}
          activeDemographic={this.state.activeDemographic}
          data={this.state.data} />
      </div>
    );
  }
}
