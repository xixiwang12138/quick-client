import React from 'react';

class CoordinateAxis extends React.Component {
    render() {
        const sections = 10; // 划分为10个段
        const sectionLength = 65535 / sections;
        const markedSection = 3; // 要标记的段号

        const axis = [];
        for (let i = 1; i <= 65535; i++) {
            axis.push(i);
        }

        const axisWithMarker = axis.map((value, index) => {
            const sectionIndex = Math.floor(value / sectionLength);
            if (sectionIndex === markedSection) {
                return <span key={index}><strong>{value}</strong></span>;
            } else {
                return <span key={index}>{value}</span>;
            }
        });

        return (
            <div>
                {axisWithMarker}
            </div>
        );
    }
}

export default CoordinateAxis;