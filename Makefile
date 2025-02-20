CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2

all: simulator

simulator: core.o simulator.o main.o
	$(CXX) $(CXXFLAGS) -o simulator core.o simulator.o main.o

core.o: core.cpp core.h
	$(CXX) $(CXXFLAGS) -c core.cpp -o core.o

simulator.o: simulator.cpp simulator.h
	$(CXX) $(CXXFLAGS) -c simulator.cpp -o simulator.o

main.o: main.cpp
	$(CXX) $(CXXFLAGS) -c main.cpp -o main.o

clean:
	rm -f *.o simulator
