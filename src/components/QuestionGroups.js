import React from 'react';
import Filters from './Filters';
import './QuestionGroups.scss';

export default class QuestionGroups extends React.Component{

  render(){

    let { questionGroups, toggleQuestionGroups, activeQuestionGroup, toggleDemographic } = this.props;

    return (

      <div className="question-groups">
        {activeQuestionGroup &&
          <Filters toggleDemographic={toggleDemographic} />}
        <div className="question-groups__group-wrapper" style={{ width: Object.keys(questionGroups).length * 300 }}>
          <p className="button--text margin-bottom-15 block">Analysis & Findings</p>

        {Object.keys(questionGroups).sort((a,b)=> questionGroups[a].order - questionGroups[b].order)
          .filter((k)=> k!='' ).map((k,i)=>(
            <div
              className={`question-groups__group ${activeQuestionGroup==k ? 'active' : ''}`}
              key={`question-${i}`}
              onClick={()=>{toggleQuestionGroups(questionGroups[k], k)}}>
              <span>{k}</span>
            </div>
          ))}

        </div>
      </div>
    );
  }
}
