import React, { Component } from "react";
import PropTypes from "prop-types";
import { cordovaDot } from "../../utils/cordovaUtils";
import { renderLog } from "../../utils/logging";

export default class RatingPopover extends Component {
  static propTypes = {
    show_description: PropTypes.bool,
    toggle_description: PropTypes.func,
  };

  render () {
    renderLog(__filename);

    let { show_description, toggle_description } = this.props;

    let ratingDescription = <div className="u-margin-top--xs">
      Ratings are given by the organization, and collected by the
      nonprofit Vote Smart.
      <br />
      <span className="u-no-break">
        <img src={cordovaDot("/img/global/icons/down-arrow-color-icon.svg")} width="20" height="20" /> 0%
      </span> is a low score, and
      <br />
      <span className="u-no-break">
        <img src={cordovaDot("/img/global/icons/up-arrow-color-icon.svg")} width="20" height="20" /> 100%
      </span> is a high score.
      Ratings can be invaluable in showing where an incumbent has stood
      on a series of votes. Some groups select votes that tend to favor
      members of one political party over another, rather than choosing
      votes based solely on issues. Please call 1-888-VOTESMART for
      more specific information.
    </div>;

    return <div className="card-main__description card-main__rating-description u-margin-top--xs">
      <div onClick={toggle_description} className="card-main__rating-description__header u-cursor--pointer">
        (rating source: VoteSmart.org) { show_description ? <span className="glyphicon glyphicon-triangle-bottom d-print-none" /> : null }
      </div>
      { show_description ? ratingDescription : null }
    </div>;
  }
}
