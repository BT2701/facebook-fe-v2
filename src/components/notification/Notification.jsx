import {
    Avatar,
    Box,
    Center,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    VStack,
    Button,
    Flex,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import './Notification.css';
import { useEffect, useState } from 'react';
import formatTimeFromDatabase from '../sharedComponents/formatTimeFromDatabase';
import { fetchDataForNotification, getUserById, markAllAsReadNotification, markAsReadNotification } from '../../utils/getData';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import PostRedirect from './PostRedirect';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ avatarSrc, title, message, time, is_read, onClick }) => (
    <MenuItem
        _hover={{ background: '#f0f2f5' }}
        p={3}
        borderRadius="md"
        alignItems="center"
        className="notification-item"
        bg={is_read === 0 ? 'gray.100' : 'white'}
        onClick={onClick}
    >
        <Avatar src={avatarSrc} size="mm" mr={3} className="notification-item-avt" />
        <Box className="notification-item-box">
            <Box className="notification-item-box-content">
                <Text
                    fontWeight="bold"
                    fontSize="md"
                    className="notification-item-title"
                    maxWidth="200px"
                    isTruncated
                >
                    {title}
                </Text>
                <Text fontSize="sm" color="gray.600" className="notification-item-mess" noOfLines={1}>
                    {message}
                </Text>
            </Box>
            <Text fontSize="xs" color="gray.400" className="notification-item-time">
                {time}
            </Text>
        </Box>
    </MenuItem>
);

const Notifications = () => {
    const [notificationList, setNotificationList] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userNames, setUserNames] = useState({});
    const { currentUser } = useUser();
    const { inboxTick } = useNotification();
    const [openDialog, setOpenDialog] = useState(false);
    const [feedId, setFeedId] = useState(null);
    const nav = useNavigate();
    const [userId, setUserId] = useState({});
    const [actionId, setActionId] = useState({});

    const loadInbox = async () => {
        if (!currentUser?.id) {
            return;
        }
        const items = await fetchDataForNotification(currentUser.id);
        setNotificationList(items);
        setUnreadCount(items.filter((item) => item.is_read === 0).length);

        const users = await Promise.all(
            items.map(async (notification) => {
                const user = await getUserById(notification.user);
                return { [notification.user]: user?.data || user };
            })
        );
        setUserNames(Object.assign({}, ...users));
    };

    useEffect(() => {
        loadInbox();
        const timer = setInterval(loadInbox, 15000);
        return () => clearInterval(timer);
    }, [currentUser?.id, inboxTick]);

    const markAllAsRead = async () => {
        try {
            await markAllAsReadNotification(currentUser.id);
            await loadInbox();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const markAsRead = async (id, nextFeedId, action, user) => {
        try {
            await markAsReadNotification(id);
            await loadInbox();
            if (action === 1 || action === 2 || action === 5) {
                if (!nextFeedId || nextFeedId === '0') {
                    return;
                }
                setFeedId(nextFeedId);
                setUserId(user);
                setActionId(action);
                setOpenDialog(true);
            } else if (action === 3 || action === 4) {
                nav(`/profile?id=${user}`);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <Center mr={4}>
            <Menu>
                <MenuButton
                    as={IconButton}
                    aria-label="Notifications"
                    rounded="full"
                    position="relative"
                >
                    <BellIcon transform="translateY(-1px)" />
                    {unreadCount > 0 && (
                        <Box
                            position="absolute"
                            top="-1"
                            right="-1"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            width="20px"
                            height="20px"
                            fontSize="xs"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            zIndex={99}
                        >
                            {unreadCount}
                        </Box>
                    )}
                </MenuButton>
                <MenuList w="360px" maxH="400px" p={0} boxShadow="lg">
                    <Box p={3} borderBottom="1px solid #e2e8f0">
                        <Flex justifyContent="space-between" alignItems="center" height={8}>
                            <Text fontSize="lg" fontWeight="bold">
                                Notifications
                            </Text>
                            {notificationList.length > 0 && (
                                <Button className="notification-read-all" size="sm" colorScheme="blue" onClick={markAllAsRead}>
                                    Mark all as read
                                </Button>
                            )}
                        </Flex>
                    </Box>
                    <Box maxH="320px" overflowY="auto" p={2}>
                        <VStack align="stretch">
                            {notificationList.length === 0 ? (
                                <Text>Empty</Text>
                            ) : (
                                notificationList.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        avatarSrc={userNames[notification.user]?.avatar}
                                        title={userNames[notification.user]?.name || 'Loading...'}
                                        message={notification.content}
                                        time={formatTimeFromDatabase(notification.timeline)}
                                        is_read={notification.is_read}
                                        onClick={() => markAsRead(notification.id, notification.post, notification.action_n, notification.user)}
                                    />
                                ))
                            )}
                        </VStack>
                    </Box>
                </MenuList>
            </Menu>
            <PostRedirect
                feedId={feedId}
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                currentUser={currentUser?.id}
                user={userId}
                action={actionId}
            />
        </Center>
    );
};

export default Notifications;
