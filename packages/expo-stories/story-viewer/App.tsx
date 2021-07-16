import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { style } from "./styles";

export default function App() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeStoryId, setActiveStoryId] = React.useState("");
  const [stories, setStories] = React.useState([]);

  React.useEffect(() => {
    fetch(`http://localhost:7001/stories`)
      .then((res) => res.json())
      .then((json) => {
        const { data } = json;

        const formattedStories = data.map((story: any) => {
          const name = getNameFromPath(
            story.config.title || getNameFromPath(story.relativePath)
          );
          return {
            name,
            storyNames: story.config.storyNames,
            ...story,
          };
        });

        setStories(formattedStories);
      });
  }, []);

  const memoizedLowercaseSearchTerm = React.useMemo(
    () => searchTerm.toLowerCase(),
    [searchTerm]
  );

  const filteredStories = stories.filter((s) =>
    s.name.toLowerCase().includes(memoizedLowercaseSearchTerm)
  );

  return (
    <View style={style("flex-1 bg-white")}>
      <Sidebar
        {...{
          searchTerm,
          setSearchTerm,
          activeStoryId,
          setActiveStoryId,
          stories: filteredStories,
        }}
      />
    </View>
  );
}

function Sidebar({
  searchTerm,
  setSearchTerm,
  activeStoryId,
  setActiveStoryId,
  stories = [],
}) {
  return (
    <View style={style("p-6 bg-gray-100 shadow flex-1")}>
      <View style={style("flex-row")}>
        <Text style={style("text-2xl font-semibold text-gray-900")}>
          Expo Stories
        </Text>
      </View>

      <View style={style("my-6 -mx-2")}>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={style(
            "px-3 py-2 font-medium text-gray-900 rounded border-2 border-gray-300"
          )}
          placeholder="Find a component"
          placeholderTextColor={style("text-gray-700").color}
        />
      </View>

      <View>
        <View style={style("mt-2 mb-4")}>
          <Text style={style("text-lg font-bold tracking-wider text-gray-600 uppercase")}>
            Library
          </Text>
        </View>
        <View>
          {stories.map((story) => {
            const isActive = story.id === activeStoryId;

            return (
              <Pressable
                key={story.id}
                style={style("my-1 ml-2")}
                accessibilityRole="button"
                onPress={() => setActiveStoryId(story.id)}
              >
                <Text style={style("text-lg font-medium text-gray-900")}>
                  {story.name}
                </Text>
                {isActive && (
                  <View style={style("my-2")}>
                    {story.storyNames.map((storyName) => {
                      return (
                        <View key={storyName} style={style("my-1")}>
                          <Text style={style("ml-4")}>{storyName}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function getNameFromPath(pathToComponent: string) {
  const segments = pathToComponent.split("/");
  const lastSegment = segments[segments.length - 1];
  let [nameOfStory] = lastSegment.split(".");
  return nameOfStory;
}
