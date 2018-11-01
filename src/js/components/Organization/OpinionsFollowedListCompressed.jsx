import React, { Component } from "react";
import PropTypes from "prop-types";
import FollowToggle from "../Widgets/FollowToggle";
import OrganizationActions from "../../actions/OrganizationActions";
import OrganizationDisplayForListCompressed from "./OrganizationDisplayForListCompressed";
import { renderLog } from "../../utils/logging";

export default class OpinionsFollowedListCompressed extends Component {

  static propTypes = {
    ballotItemWeVoteId: PropTypes.string,
    organizationsFollowed: PropTypes.array,
    instantRefreshOn: PropTypes.bool,
    editMode: PropTypes.bool,
  };

  constructor (props) {
    super(props);
    this.state = {
      organizations_followed: [],
      ballot_item_we_vote_id: "",
    };
  }

  componentDidMount () {
    this.setState({
      organizations_followed: this.props.organizationsFollowed,
      ballot_item_we_vote_id: this.props.ballotItemWeVoteId,
    });
  }

  componentWillReceiveProps (nextProps){
    //if (nextProps.instantRefreshOn ) {
      // NOTE: This is off because we don't want the organization to disappear from the "More opinions" list when clicked
      this.setState({
        organizations_followed: nextProps.organizationsFollowed,
        ballot_item_we_vote_id: nextProps.ballotItemWeVoteId,
      });
    //}
  }

  handleIgnore (id) {
    OrganizationActions.organizationFollowIgnore(id);
    this.setState({
      organizations_followed: this.state.organizations_followed.filter( (org) => {
        return org.organization_we_vote_id !== id;
      })
    });
  }

  render () {
    renderLog(__filename);
    if (this.state.organizations_followed === undefined) {
      return null;
    }
    // zachmonteith: extra span tags inside of OrganizationDisplayForList are to ensure that {org} gets passed in
    // as an array rather than an object, so that our propTypes validations in OrganizationDisplayForList work.
    // there is probably a more elegant way to do this, but left it this way for now as it works.
    const orgs = this.state.organizations_followed.map( (org) => {
      if (this.props.editMode) {
        return <OrganizationDisplayForListCompressed key={org.organization_we_vote_id} {...org}>
              <FollowToggle organizationWeVoteId={org.organization_we_vote_id} /><span />
            </OrganizationDisplayForListCompressed>;
      } else {
        return <OrganizationDisplayForListCompressed key={org.organization_we_vote_id} {...org}>
              <span /><span /></OrganizationDisplayForListCompressed>;
      }
    });

    return <div className="guidelist card-child__list-group">
          {orgs}
      </div>;
  }

}
