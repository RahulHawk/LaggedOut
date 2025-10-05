import { IconButton } from "@mui/material";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

interface SliderArrowProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    direction: 'left' | 'right';
}

export const SliderArrow = ({ className, style, onClick, direction }: SliderArrowProps) => {
    return (
        <IconButton
            onClick={onClick}
            className={className}
            sx={{
                ...style,
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.9)' },
                ...(direction === 'left' ? { left: 10 } : { right: 10 }),
            }}
        >
            {direction === 'left' ? <AiOutlineLeft /> : <AiOutlineRight />}
        </IconButton>
    );
};