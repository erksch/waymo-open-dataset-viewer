import React, { useState } from 'react';
import { useSegments } from "../../state/segmentsReducer";
import { useDispatch } from 'react-redux';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { Spinner } from 'react-activity';
import styled from 'styled-components';
import 'react-activity/dist/react-activity.css';
import { useActiveSegment } from '../../state/configReducer';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const DropDown = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
  background-color: black;
  flex-direction: column;
  position: absolute;
  border: 2px solid white;
  border-top: none;
  left: -2px;
  right: -2px;
  z-index: 1000;
  top: calc(100% + 12px);
  border: 1px solid hsl(0, 0%, 20%);
  border-radius: 4px;
  box-shadow: 0 0 12px 8px hsla(0, 0%, 0%, 1);
`;

const DropDownItem = styled.button`
  border: none;
  color: white;
  padding: 10px;
  justify-content: flex-start;
  font-weight: normal;
  border-radius: 0;
  outline: none;
  background-color: black;
  cursor: pointer;

  &:hover {
    background-color: hsl(0, 0%, 20%);
  }

  & + & {
    border-top: 1px solid hsl(0, 0%, 20%);
  }
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
  font-weight: normal;
  position: relative;
  border-radius: 40px;
  background-color: black;
  text-align: left;
  color: white;
  border: 2px solid white;
  padding: 10px 20px;

  span {
    flex: 1;
    width: 0;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  svg {
    margin-left: 10px;
    font-size: 16px;
  }
`;

const SegmentsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const activeSegment = useActiveSegment();
  const segmentIds = useSegments().map((segment) => segment.id);
  const handleSegmentClick = (segmentId: string) => {
    dispatch({ type: 'SET_ACTIVE_SEGMENT', segmentId });
  };

  return (
    <Container>
      <Trigger onClick={() => setIsOpen(!isOpen)}>
        <span>{activeSegment ? activeSegment.id : 'Loading segments...'}</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </Trigger>
      {isOpen && (
        <DropDown>
          {segmentIds.length > 0 ? segmentIds.map((segmentId) => (
            <DropDownItem onClick={() => handleSegmentClick(segmentId)}>
              {segmentId}
            </DropDownItem>
          )) : (
            <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center', padding: '10px' }}>
              <Spinner color="white" size={14} />
            </div>
          )}
        </DropDown>
      )}
    </Container>
  );
};

export default SegmentsDropdown;
