import React from 'react'
import useProfile from '../hooks/useProfile'
import styles from '../css/components/profilecard.module.css'
import { Col, Row } from 'react-bootstrap';
import { formatDate, availableViews } from '../util/Util';
import { IconButton, Tooltip } from '@material-ui/core';
import { Link } from 'react-router-dom';
import CloseIcon from '@material-ui/icons/Close';
import { unfollowProfile } from '../util/MellonUtils/profile';

const ProfileCardComponent = (props) => {
  const profileWebId = props.profileWebId

  const profile = useProfile(profileWebId)
  if(!profile || !profile.name) return(<div />);

  const unfollow = async() => {
    try { 
      const result = await unfollowProfile(props.webId, profileWebId) 
    }
    catch (e) { window.alert(e.message)}
  }

  return (
    <div id="ProfileCardComponent" className={styles.container}>
      {profile && Object.keys(profileProps).map(property => {
        const value = profile[property] && (property === 'bdate' ? formatDate(profile[property]) : profile[property])
        return (
          <Row className={`propertyview ${styles.profilecardrow}`} key={property}>
            <Col sm={12} md={4}><label className="leftaligntext"><b>{profileProps[property]}</b></label></Col>
            <Col sm={12} md={8}>
              <label className="leftaligntext">
                {property === 'name' ? <a href={profileWebId}>{value}</a> : <div>{value}</div>}
              </label>
            </Col>
          </Row>
        )
      })}
      <Row className={`propertyview ${styles.profilecardrow}`} key={'links'}>
        {props.showButtons && [availableViews.profile, availableViews.documents, availableViews.feed].map(item =>
          {console.log(item); return( 
          <Col sm={3} md={2} key={item.id}>
            <Link to={{ pathname: item.target, search: `?selectedWebId=${profileWebId}`}}>
              <Tooltip title={item.label}>
                <IconButton aria-label={item.label}>
                    {item.icon}
                </IconButton>
              </Tooltip>
            </Link>
          </Col>
            )}
          )
        }
        {props.showButtons && 
          <Col sm={3} md={2} key={'unfollow'}>
            <Tooltip title={'unfollow'}>
              <IconButton onClick={unfollow}>
                  <CloseIcon />
              </IconButton>
            </Tooltip>
          </Col>
        }
      </Row>
    </div>
  )
}

const profileProps = {
  name: "Name",
  bdate: "BirthDate",
  location: "Country",
  // cstatus: "Civil Status",
}

export default ProfileCardComponent
