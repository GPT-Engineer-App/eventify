import React, { useState, useEffect } from "react";
import { Box, Heading, Text, Button, Input, Textarea, FormControl, FormLabel, Stack, useToast } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = "http://localhost:1337/api";

const Index = () => {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchEvents();
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      const data = await response.json();
      setEvents(data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const createEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ data: { name, description } }),
      });
      const data = await response.json();
      setEvents([...events, data.data]);
      setName("");
      setDescription("");
      toast({
        title: "Event created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error creating event.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateEvent = async () => {
    try {
      const response = await fetch(`${API_URL}/events/${editingEventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ data: { name, description } }),
      });
      const data = await response.json();
      setEvents(events.map((event) => (event.id === data.data.id ? data.data : event)));
      setEditingEventId(null);
      setName("");
      setDescription("");
      toast({
        title: "Event updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error updating event.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteEvent = async (id) => {
    try {
      await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvents(events.filter((event) => event.id !== id));
      toast({
        title: "Event deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error deleting event.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: "user@example.com", password: "password" }),
      });
      const data = await response.json();
      localStorage.setItem("token", data.jwt);
      setIsLoggedIn(true);
      toast({
        title: "Logged in successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      toast({
        title: "Error logging in.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    toast({
      title: "Logged out successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box maxWidth="600px" margin="auto" padding="4">
      <Heading as="h1" size="xl" textAlign="center" marginBottom="8">
        Event Management
      </Heading>

      {!isLoggedIn ? (
        <Box textAlign="center">
          <Button onClick={handleLogin}>Login</Button>
        </Box>
      ) : (
        <>
          <Box marginBottom="8">
            <FormControl id="name" marginBottom="4">
              <FormLabel>Event Name</FormLabel>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl id="description">
              <FormLabel>Event Description</FormLabel>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormControl>
            <Button leftIcon={<FaPlus />} colorScheme="blue" marginTop="4" onClick={editingEventId ? updateEvent : createEvent}>
              {editingEventId ? "Update Event" : "Create Event"}
            </Button>
          </Box>

          <Stack spacing="4">
            {events.map((event) => (
              <Box key={event.id} borderWidth="1px" borderRadius="md" padding="4">
                <Heading as="h2" size="md">
                  {event.attributes.name}
                </Heading>
                <Text>{event.attributes.description}</Text>
                <Box marginTop="4">
                  <Button
                    leftIcon={<FaEdit />}
                    colorScheme="green"
                    size="sm"
                    marginRight="2"
                    onClick={() => {
                      setEditingEventId(event.id);
                      setName(event.attributes.name);
                      setDescription(event.attributes.description);
                    }}
                  >
                    Edit
                  </Button>
                  <Button leftIcon={<FaTrash />} colorScheme="red" size="sm" onClick={() => deleteEvent(event.id)}>
                    Delete
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>

          <Box textAlign="center" marginTop="8">
            <Button onClick={handleLogout}>Logout</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Index;
