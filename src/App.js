// import libraries
import React from 'react';
import { nest } from 'd3';

// import components
import QuestionGroups from './components/QuestionGroups';
import Charts from './components/Charts';
import './App.scss';

export default class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {};
  }

  // QUESTION: Where is the data coming from? => GOTO:87
  // Data is retrieved by fetchData(), stored on Heroku.
  generateInitialState = (data) => {

    // create **empty object** to hold question groups
    let questionGroups = {};

    // for each question listed in data.metaData, add to array
    for(let k in data.metaData.question_id){

      // set current question using question_id
      let q = data.metaData.question_id[k];

      // get parameters associated with current question
      let label = q.group;
      let order = q.group_order;

      // if questionGroup does not already have a "label" object, create one
      // each label contains 3 additional subelements: label, order, and ids, which is an array
      // QUESTION: Where is questionGroups[label].label assigned?
      if(!questionGroups[label]) questionGroups[label] = {label, order, ids: []};

      // add question_id to the array of ids
      questionGroups[label].ids.push(q.question_id);
    }

    return {
      questionGroups,
      responses: data.metaData.response_id,
      questions: data.metaData.question_id,
      data: data.data,
      // fetch state
      isFetching: false,
      activeQuestionIds: this.props.questionIds,
      activeDemographic: null,
      activeQuestionGroup: this.props.questionGroup
    };
  }

  toggleQuestionGroups = (q, key) => {

    let qry = {
      question_id__in: q.ids,
      demographic_key__in: [this.state.activeDemographic, 'Total'] || ['Total'],
      group_by: ['question_id', 'demographic_value']
    }

    this.fetchData(qry, (data)=>{
      this.setState({
        data: data.data,
        isFetching: false,
        activeQuestionGroup: key,
        activeQuestionIds: q.ids
      });
    });
  }

  toggleDemographic = (demo) => {
    let qry = {
      question_id__in: this.state.activeQuestionIds,
      demographic_key__in: [demo, 'Total'] || ['Total'],
      group_by: ['question_id', 'demographic_value']
    }

    this.fetchData(qry, (data)=>{
      this.setState({
        data: data.data,
        isFetching: false,
        activeDemographic: demo
      });
    });

  }

  scrollToCharts = () => {
    if(!this.el) return;
    let scrollTop = this.el.parentElement.getBoundingClientRect().top + (window.pageYOffset || window.scrollY);
    window.scrollTo(0,scrollTop-90);
  }

  fetchData = (qry={}, cb=()=>{}) => {
    let url = new URL('https://chart-studio.herokuapp.com/api/v1/projects/5b04194ca5783e1275b0ab89/data');
    for(let k in qry){
      if(qry[k] instanceof Array)
        qry[k].forEach((q)=> url.searchParams.append(`${k}[]`, q));
      else
        url.searchParams.append(k, qry[k])
    }
    this.scrollToCharts();
    this.setState({ isFetching: true });
    fetch(url.toString())
      .then((res)=>(
        res.json()
      )).then((data)=>{
        cb(data);
      });
  }

  componentWillMount(){
    let qry = {
      question_id__in: this.props.questionIds,
      demographic_key__in: ['Total'],
      group_by: ['question_id', 'demographic_value'],
      metadata: true
    }

    this.fetchData(qry, (data)=>{
      let initState = this.generateInitialState(data);
      this.setState(initState);
    });
  }

  render(){
    return(
      <div className="varying-degrees-2018 full-app scroll-target" data-scroll-bottom-offset="-100vh" ref={(el)=>{this.el = el;}}>
        {this.state.data && <div className="row">

          <div className="col-12 col-lg-4 toggles-wrapper">
            {this.state.isFetching && <div className="blur" />}
          <QuestionGroups
            questionGroups={this.state.questionGroups}
            activeQuestionGroup={this.state.activeQuestionGroup}
            toggleQuestionGroups={this.toggleQuestionGroups}
            toggleDemographic={this.toggleDemographic} />
          </div>

          <div className="col-12 col-lg-8 charts-wrapper">
          {!this.state.isFetching && <Charts questions={this.state.questions}
              responses={this.state.responses}
              scrollToCharts={this.scrollToCharts}
              data={this.state.data} />}
          </div>
        </div>}
      </div>
    );
  }
}
